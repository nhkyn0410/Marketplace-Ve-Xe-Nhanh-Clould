//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'trip_status_input_dto.g.dart';

/// TripStatusInputDto
///
/// Properties:
/// * [status] 
/// * [reason] 
@BuiltValue()
abstract class TripStatusInputDto implements Built<TripStatusInputDto, TripStatusInputDtoBuilder> {
  @BuiltValueField(wireName: r'status')
  TripStatusInputDtoStatusEnum get status;
  // enum statusEnum {  OPEN_FOR_SALE,  LOCKED,  DRAFT,  CANCELLED,  };

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  TripStatusInputDto._();

  factory TripStatusInputDto([void updates(TripStatusInputDtoBuilder b)]) = _$TripStatusInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TripStatusInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TripStatusInputDto> get serializer => _$TripStatusInputDtoSerializer();
}

class _$TripStatusInputDtoSerializer implements PrimitiveSerializer<TripStatusInputDto> {
  @override
  final Iterable<Type> types = const [TripStatusInputDto, _$TripStatusInputDto];

  @override
  final String wireName = r'TripStatusInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TripStatusInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(TripStatusInputDtoStatusEnum),
    );
    yield r'reason';
    yield object.reason == null ? null : serializers.serialize(
      object.reason,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TripStatusInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TripStatusInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(TripStatusInputDtoStatusEnum),
          ) as TripStatusInputDtoStatusEnum;
          result.status = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TripStatusInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TripStatusInputDtoBuilder();
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


class TripStatusInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OPEN_FOR_SALE')
  static const TripStatusInputDtoStatusEnum OPEN_FOR_SALE = _$tripStatusInputDtoStatusEnum_OPEN_FOR_SALE;
  @BuiltValueEnumConst(wireName: r'LOCKED')
  static const TripStatusInputDtoStatusEnum LOCKED = _$tripStatusInputDtoStatusEnum_LOCKED;
  @BuiltValueEnumConst(wireName: r'DRAFT')
  static const TripStatusInputDtoStatusEnum DRAFT = _$tripStatusInputDtoStatusEnum_DRAFT;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const TripStatusInputDtoStatusEnum CANCELLED = _$tripStatusInputDtoStatusEnum_CANCELLED;

  static Serializer<TripStatusInputDtoStatusEnum> get serializer => _$tripStatusInputDtoStatusEnumSerializer;

  const TripStatusInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<TripStatusInputDtoStatusEnum> get values => _$tripStatusInputDtoStatusEnumValues;
  static TripStatusInputDtoStatusEnum valueOf(String name) => _$tripStatusInputDtoStatusEnumValueOf(name);
}

