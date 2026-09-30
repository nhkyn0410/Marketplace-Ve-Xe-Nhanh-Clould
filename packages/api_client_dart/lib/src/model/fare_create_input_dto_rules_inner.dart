//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_create_input_dto_rules_inner.g.dart';

/// FareCreateInputDtoRulesInner
///
/// Properties:
/// * [vehicleTypeId] 
/// * [seatType] 
/// * [validFrom] 
/// * [validTo] 
/// * [price] 
@BuiltValue()
abstract class FareCreateInputDtoRulesInner implements Built<FareCreateInputDtoRulesInner, FareCreateInputDtoRulesInnerBuilder> {
  @BuiltValueField(wireName: r'vehicleTypeId')
  String? get vehicleTypeId;

  @BuiltValueField(wireName: r'seatType')
  FareCreateInputDtoRulesInnerSeatTypeEnum? get seatType;
  // enum seatTypeEnum {  SEAT,  BED,  };

  @BuiltValueField(wireName: r'validFrom')
  DateTime? get validFrom;

  @BuiltValueField(wireName: r'validTo')
  DateTime? get validTo;

  @BuiltValueField(wireName: r'price')
  int get price;

  FareCreateInputDtoRulesInner._();

  factory FareCreateInputDtoRulesInner([void updates(FareCreateInputDtoRulesInnerBuilder b)]) = _$FareCreateInputDtoRulesInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareCreateInputDtoRulesInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareCreateInputDtoRulesInner> get serializer => _$FareCreateInputDtoRulesInnerSerializer();
}

class _$FareCreateInputDtoRulesInnerSerializer implements PrimitiveSerializer<FareCreateInputDtoRulesInner> {
  @override
  final Iterable<Type> types = const [FareCreateInputDtoRulesInner, _$FareCreateInputDtoRulesInner];

  @override
  final String wireName = r'FareCreateInputDtoRulesInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareCreateInputDtoRulesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'vehicleTypeId';
    yield object.vehicleTypeId == null ? null : serializers.serialize(
      object.vehicleTypeId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'seatType';
    yield object.seatType == null ? null : serializers.serialize(
      object.seatType,
      specifiedType: const FullType.nullable(FareCreateInputDtoRulesInnerSeatTypeEnum),
    );
    yield r'validFrom';
    yield object.validFrom == null ? null : serializers.serialize(
      object.validFrom,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'validTo';
    yield object.validTo == null ? null : serializers.serialize(
      object.validTo,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'price';
    yield serializers.serialize(
      object.price,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareCreateInputDtoRulesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareCreateInputDtoRulesInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'vehicleTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.vehicleTypeId = valueDes;
          break;
        case r'seatType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(FareCreateInputDtoRulesInnerSeatTypeEnum),
          ) as FareCreateInputDtoRulesInnerSeatTypeEnum?;
          if (valueDes == null) continue;
          result.seatType = valueDes;
          break;
        case r'validFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.validFrom = valueDes;
          break;
        case r'validTo':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.validTo = valueDes;
          break;
        case r'price':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.price = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareCreateInputDtoRulesInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareCreateInputDtoRulesInnerBuilder();
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


class FareCreateInputDtoRulesInnerSeatTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SEAT')
  static const FareCreateInputDtoRulesInnerSeatTypeEnum SEAT = _$fareCreateInputDtoRulesInnerSeatTypeEnum_SEAT;
  @BuiltValueEnumConst(wireName: r'BED')
  static const FareCreateInputDtoRulesInnerSeatTypeEnum BED = _$fareCreateInputDtoRulesInnerSeatTypeEnum_BED;

  static Serializer<FareCreateInputDtoRulesInnerSeatTypeEnum> get serializer => _$fareCreateInputDtoRulesInnerSeatTypeEnumSerializer;

  const FareCreateInputDtoRulesInnerSeatTypeEnum._(String name): super(name);

  static BuiltSet<FareCreateInputDtoRulesInnerSeatTypeEnum> get values => _$fareCreateInputDtoRulesInnerSeatTypeEnumValues;
  static FareCreateInputDtoRulesInnerSeatTypeEnum valueOf(String name) => _$fareCreateInputDtoRulesInnerSeatTypeEnumValueOf(name);
}

