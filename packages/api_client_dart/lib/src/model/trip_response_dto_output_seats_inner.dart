//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_response_dto_output_seats_inner.g.dart';

/// TripResponseDtoOutputSeatsInner
///
/// Properties:
/// * [code] 
/// * [deck] 
/// * [row] 
/// * [column] 
/// * [type] 
/// * [status] 
@BuiltValue()
abstract class TripResponseDtoOutputSeatsInner implements Built<TripResponseDtoOutputSeatsInner, TripResponseDtoOutputSeatsInnerBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'deck')
  int get deck;

  @BuiltValueField(wireName: r'row')
  int get row;

  @BuiltValueField(wireName: r'column')
  int get column;

  @BuiltValueField(wireName: r'type')
  TripResponseDtoOutputSeatsInnerTypeEnum get type;
  // enum typeEnum {  SEAT,  BED,  };

  @BuiltValueField(wireName: r'status')
  TripResponseDtoOutputSeatsInnerStatusEnum get status;
  // enum statusEnum {  AVAILABLE,  HOLDING,  BOOKED,  CHECKED_IN,  BLOCKED,  };

  TripResponseDtoOutputSeatsInner._();

  factory TripResponseDtoOutputSeatsInner([void updates(TripResponseDtoOutputSeatsInnerBuilder b)]) = _$TripResponseDtoOutputSeatsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripResponseDtoOutputSeatsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripResponseDtoOutputSeatsInner> get serializer => _$TripResponseDtoOutputSeatsInnerSerializer();
}

class _$TripResponseDtoOutputSeatsInnerSerializer implements PrimitiveSerializer<TripResponseDtoOutputSeatsInner> {
  @override
  final Iterable<Type> types = const [TripResponseDtoOutputSeatsInner, _$TripResponseDtoOutputSeatsInner];

  @override
  final String wireName = r'TripResponseDtoOutputSeatsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripResponseDtoOutputSeatsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'deck';
    yield serializers.serialize(
      object.deck,
      specifiedType: const FullType(int),
    );
    yield r'row';
    yield serializers.serialize(
      object.row,
      specifiedType: const FullType(int),
    );
    yield r'column';
    yield serializers.serialize(
      object.column,
      specifiedType: const FullType(int),
    );
    yield r'type';
    yield serializers.serialize(
      object.type,
      specifiedType: const FullType(TripResponseDtoOutputSeatsInnerTypeEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(TripResponseDtoOutputSeatsInnerStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TripResponseDtoOutputSeatsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripResponseDtoOutputSeatsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'deck':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.deck = valueDes;
          break;
        case r'row':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.row = valueDes;
          break;
        case r'column':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.column = valueDes;
          break;
        case r'type':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(TripResponseDtoOutputSeatsInnerTypeEnum),
          ) as TripResponseDtoOutputSeatsInnerTypeEnum;
          result.type = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(TripResponseDtoOutputSeatsInnerStatusEnum),
          ) as TripResponseDtoOutputSeatsInnerStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TripResponseDtoOutputSeatsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripResponseDtoOutputSeatsInnerBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}


class TripResponseDtoOutputSeatsInnerTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SEAT')
  static const TripResponseDtoOutputSeatsInnerTypeEnum SEAT = _$tripResponseDtoOutputSeatsInnerTypeEnum_SEAT;
  @BuiltValueEnumConst(wireName: r'BED')
  static const TripResponseDtoOutputSeatsInnerTypeEnum BED = _$tripResponseDtoOutputSeatsInnerTypeEnum_BED;

  static Serializer<TripResponseDtoOutputSeatsInnerTypeEnum> get serializer => _$tripResponseDtoOutputSeatsInnerTypeEnumSerializer;

  const TripResponseDtoOutputSeatsInnerTypeEnum._(String name): super(name);

  static BuiltSet<TripResponseDtoOutputSeatsInnerTypeEnum> get values => _$tripResponseDtoOutputSeatsInnerTypeEnumValues;
  static TripResponseDtoOutputSeatsInnerTypeEnum valueOf(String name) => _$tripResponseDtoOutputSeatsInnerTypeEnumValueOf(name);
}

class TripResponseDtoOutputSeatsInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'AVAILABLE')
  static const TripResponseDtoOutputSeatsInnerStatusEnum AVAILABLE = _$tripResponseDtoOutputSeatsInnerStatusEnum_AVAILABLE;
  @BuiltValueEnumConst(wireName: r'HOLDING')
  static const TripResponseDtoOutputSeatsInnerStatusEnum HOLDING = _$tripResponseDtoOutputSeatsInnerStatusEnum_HOLDING;
  @BuiltValueEnumConst(wireName: r'BOOKED')
  static const TripResponseDtoOutputSeatsInnerStatusEnum BOOKED = _$tripResponseDtoOutputSeatsInnerStatusEnum_BOOKED;
  @BuiltValueEnumConst(wireName: r'CHECKED_IN')
  static const TripResponseDtoOutputSeatsInnerStatusEnum CHECKED_IN = _$tripResponseDtoOutputSeatsInnerStatusEnum_CHECKED_IN;
  @BuiltValueEnumConst(wireName: r'BLOCKED')
  static const TripResponseDtoOutputSeatsInnerStatusEnum BLOCKED = _$tripResponseDtoOutputSeatsInnerStatusEnum_BLOCKED;

  static Serializer<TripResponseDtoOutputSeatsInnerStatusEnum> get serializer => _$tripResponseDtoOutputSeatsInnerStatusEnumSerializer;

  const TripResponseDtoOutputSeatsInnerStatusEnum._(String name): super(name);

  static BuiltSet<TripResponseDtoOutputSeatsInnerStatusEnum> get values => _$tripResponseDtoOutputSeatsInnerStatusEnumValues;
  static TripResponseDtoOutputSeatsInnerStatusEnum valueOf(String name) => _$tripResponseDtoOutputSeatsInnerStatusEnumValueOf(name);
}

