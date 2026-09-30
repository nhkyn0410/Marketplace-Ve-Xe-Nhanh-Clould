//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/fare_create_input_dto_rules_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'fare_create_input_dto.g.dart';

/// FareCreateInputDto
///
/// Properties:
/// * [status] 
/// * [note] 
/// * [rules] 
/// * [routeId] 
@BuiltValue()
abstract class FareCreateInputDto implements Built<FareCreateInputDto, FareCreateInputDtoBuilder> {
  @BuiltValueField(wireName: r'status')
  FareCreateInputDtoStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'rules')
  BuiltList<FareCreateInputDtoRulesInner> get rules;

  @BuiltValueField(wireName: r'routeId')
  String get routeId;

  FareCreateInputDto._();

  factory FareCreateInputDto([void updates(FareCreateInputDtoBuilder b)]) = _$FareCreateInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FareCreateInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FareCreateInputDto> get serializer => _$FareCreateInputDtoSerializer();
}

class _$FareCreateInputDtoSerializer implements PrimitiveSerializer<FareCreateInputDto> {
  @override
  final Iterable<Type> types = const [FareCreateInputDto, _$FareCreateInputDto];

  @override
  final String wireName = r'FareCreateInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FareCreateInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(FareCreateInputDtoStatusEnum),
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
    yield r'routeId';
    yield serializers.serialize(
      object.routeId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FareCreateInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FareCreateInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(FareCreateInputDtoStatusEnum),
          ) as FareCreateInputDtoStatusEnum;
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
        case r'routeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.routeId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FareCreateInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FareCreateInputDtoBuilder();
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


class FareCreateInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const FareCreateInputDtoStatusEnum ACTIVE = _$fareCreateInputDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const FareCreateInputDtoStatusEnum INACTIVE = _$fareCreateInputDtoStatusEnum_INACTIVE;

  static Serializer<FareCreateInputDtoStatusEnum> get serializer => _$fareCreateInputDtoStatusEnumSerializer;

  const FareCreateInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<FareCreateInputDtoStatusEnum> get values => _$fareCreateInputDtoStatusEnumValues;
  static FareCreateInputDtoStatusEnum valueOf(String name) => _$fareCreateInputDtoStatusEnumValueOf(name);
}

