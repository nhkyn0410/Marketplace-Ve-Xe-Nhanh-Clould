//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_create_input_dto_rules_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_update_input_dto.g.dart';

/// FareUpdateInputDto
///
/// Properties:
/// * [status] 
/// * [note] 
/// * [rules] 
@BuiltValue()
abstract class FareUpdateInputDto implements Built<FareUpdateInputDto, FareUpdateInputDtoBuilder> {
  @BuiltValueField(wireName: r'status')
  FareUpdateInputDtoStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'rules')
  BuiltList<FareCreateInputDtoRulesInner> get rules;

  FareUpdateInputDto._();

  factory FareUpdateInputDto([void updates(FareUpdateInputDtoBuilder b)]) = _$FareUpdateInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareUpdateInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareUpdateInputDto> get serializer => _$FareUpdateInputDtoSerializer();
}

class _$FareUpdateInputDtoSerializer implements PrimitiveSerializer<FareUpdateInputDto> {
  @override
  final Iterable<Type> types = const [FareUpdateInputDto, _$FareUpdateInputDto];

  @override
  final String wireName = r'FareUpdateInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareUpdateInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(FareUpdateInputDtoStatusEnum),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'rules';
    yield serializers.serialize(
      object.rules,
      specifiedType: const FullType(BuiltList, [FullType(FareCreateInputDtoRulesInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareUpdateInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareUpdateInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareUpdateInputDtoStatusEnum),
          ) as FareUpdateInputDtoStatusEnum;
          result.status = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'rules':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(FareCreateInputDtoRulesInner)]),
          ) as BuiltList<FareCreateInputDtoRulesInner>;
          result.rules.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareUpdateInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareUpdateInputDtoBuilder();
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


class FareUpdateInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FareUpdateInputDtoStatusEnum ACTIVE = _$fareUpdateInputDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const FareUpdateInputDtoStatusEnum INACTIVE = _$fareUpdateInputDtoStatusEnum_INACTIVE;

  static Serializer<FareUpdateInputDtoStatusEnum> get serializer => _$fareUpdateInputDtoStatusEnumSerializer;

  const FareUpdateInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<FareUpdateInputDtoStatusEnum> get values => _$fareUpdateInputDtoStatusEnumValues;
  static FareUpdateInputDtoStatusEnum valueOf(String name) => _$fareUpdateInputDtoStatusEnumValueOf(name);
}

